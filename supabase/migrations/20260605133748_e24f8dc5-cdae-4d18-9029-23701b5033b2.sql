
-- ALUNOS
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_matricula DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access alunos" ON public.alunos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TURMAS
CREATE TABLE public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  curso TEXT,
  dias_semana TEXT,
  horario TEXT,
  professor TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access turmas" ON public.turmas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Aluno <-> Turma (relação simples via aluno.turma_id? O spec coloca turma_id em mensalidades. Mantemos só lá.)

-- MENSALIDADES
CREATE TABLE public.mensalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_pagamento DATE,
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mensalidades_aluno ON public.mensalidades(aluno_id);
CREATE INDEX idx_mensalidades_status ON public.mensalidades(status);
CREATE INDEX idx_mensalidades_venc ON public.mensalidades(data_vencimento);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensalidades TO authenticated;
GRANT ALL ON public.mensalidades TO service_role;
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access mensalidades" ON public.mensalidades FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PAGAMENTOS
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  mensalidade_id UUID REFERENCES public.mensalidades(id) ON DELETE SET NULL,
  valor_pago NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access pagamentos" ON public.pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MENSAGENS
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  tipo TEXT,
  canal TEXT DEFAULT 'whatsapp',
  conteudo TEXT,
  status_envio TEXT DEFAULT 'pendente',
  enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens TO authenticated;
GRANT ALL ON public.mensagens TO service_role;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access mensagens" ON public.mensagens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- IMPORTACOES
CREATE TABLE public.importacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origem TEXT,
  total_linhas INT DEFAULT 0,
  novos_registros INT DEFAULT 0,
  registros_atualizados INT DEFAULT 0,
  erros INT DEFAULT 0,
  executado_em TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.importacoes TO authenticated;
GRANT ALL ON public.importacoes TO service_role;
ALTER TABLE public.importacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access importacoes" ON public.importacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vincular aluno a turma (simples campo opcional)
ALTER TABLE public.alunos ADD COLUMN turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL;

-- CONFIGURACOES (singleton de webhooks)
CREATE TABLE public.configuracoes (
  id INT PRIMARY KEY DEFAULT 1,
  webhook_importacao TEXT,
  webhook_cobranca_individual TEXT,
  webhook_cobranca_lote TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
INSERT INTO public.configuracoes (id) VALUES (1);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth full access configuracoes" ON public.configuracoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
