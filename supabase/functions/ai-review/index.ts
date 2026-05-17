import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AiSettings = {
  provider: string;
  api_base_url: string;
  model: string;
  api_key: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Edge Function 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');

    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) throw new Error('请先登录后再调用 AI 后端函数');

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: settings, error: settingsError } = await admin
      .from('research_growth_ai_settings')
      .select('provider,api_base_url,model,api_key')
      .eq('user_id', userData.user.id)
      .maybeSingle<AiSettings>();
    if (settingsError) throw new Error(`读取 AI 配置失败：${settingsError.message}`);
    if (!settings?.api_key) throw new Error('当前账号还没有保存 AI API Key');

    const body = await req.json().catch(() => ({}));
    if (body.mode === 'test') {
      return json({ ok: true, provider: settings.provider, model: settings.model, message: '后端函数和账号 AI 配置可用' });
    }
    if (body.mode !== 'review') throw new Error('未知 AI 操作');

    const text = await requestAiReview(settings, body.reviewData, body.periodLabel || body.reviewData?.period?.type || '周报');
    return json({ ok: true, provider: settings.provider, model: settings.model, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ ok: false, error: message }, 400);
  }
});

async function requestAiReview(settings: AiSettings, reviewData: unknown, periodLabel: string) {
  const baseUrl = (settings.api_base_url || 'https://api.deepseek.com').replace(/\/$/, '');
  const endpoint = `${baseUrl}/chat/completions`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.api_key}`,
    },
    body: JSON.stringify({
      model: settings.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个温柔但具体的博士成长教练。请基于用户提供的结构化数据，用中文生成周期报告。严禁使用 Markdown 语法，不要使用 #、*、- 作为标题或列表符号；请使用普通中文段落、中文编号和清晰小标题。' },
        { role: 'user', content: `请生成一份${periodLabel}。内容包括：一、周期概览；二、完成和专注投入；三、项目进展；四、主要卡点；五、下个周期建议；六、一句具体鼓励。请输出普通文本，不要 Markdown。数据：${JSON.stringify(reviewData)}` },
      ],
      temperature: 0.7,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `AI 服务请求失败：${res.status}`);
  return data?.choices?.[0]?.message?.content?.trim() || data?.output_text || 'AI 没有返回文本';
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
