import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type AiSettings = {
  provider: string;
  api_base_url: string;
  model: string;
  api_key: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: '只支持 POST 请求' }, 405);

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

    const reviewMode = body.reviewMode === 'custom' ? 'custom' : 'weekly';
    const userRequest = String(body.userRequest || '').slice(0, 2000);
    const text = await requestAiReview(settings, body.reviewData, reviewMode, userRequest);
    return json({ ok: true, provider: settings.provider, model: settings.model, text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ ok: false, error: message }, 400);
  }
});

async function requestAiReview(settings: AiSettings, reviewData: unknown, reviewMode: 'weekly' | 'custom', userRequest: string) {
  const baseUrl = (settings.api_base_url || 'https://api.deepseek.com').replace(/\/$/, '');
  const endpoint = `${baseUrl}/chat/completions`;
  const prompt = reviewMode === 'custom'
    ? `请按用户的自定义需求处理这些成长数据。用户需求：${userRequest || '请给出可执行建议'}。数据：${JSON.stringify(reviewData)}`
    : `请总结最近一周内容，输出：本周概览、完成与专注、项目进展、主要卡点、下周三项行动、具体鼓励。数据：${JSON.stringify(reviewData)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.api_key}`,
    },
    body: JSON.stringify({
      model: settings.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个温柔但具体的博士成长教练。请基于用户提供的结构化数据，用中文输出。可以使用 Markdown 标题和列表，但结构要清晰，便于前端渲染成阅读版。' },
        { role: 'user', content: prompt },
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
