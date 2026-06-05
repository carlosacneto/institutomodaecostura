export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string
          data_matricula: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          turma_id: string | null
        }
        Insert: {
          created_at?: string
          data_matricula?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          turma_id?: string | null
        }
        Update: {
          created_at?: string
          data_matricula?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          id: number
          updated_at: string
          webhook_cobranca_individual: string | null
          webhook_cobranca_lote: string | null
          webhook_importacao: string | null
        }
        Insert: {
          id?: number
          updated_at?: string
          webhook_cobranca_individual?: string | null
          webhook_cobranca_lote?: string | null
          webhook_importacao?: string | null
        }
        Update: {
          id?: number
          updated_at?: string
          webhook_cobranca_individual?: string | null
          webhook_cobranca_lote?: string | null
          webhook_importacao?: string | null
        }
        Relationships: []
      }
      importacoes: {
        Row: {
          created_at: string
          erros: number | null
          executado_em: string | null
          id: string
          novos_registros: number | null
          origem: string | null
          registros_atualizados: number | null
          total_linhas: number | null
        }
        Insert: {
          created_at?: string
          erros?: number | null
          executado_em?: string | null
          id?: string
          novos_registros?: number | null
          origem?: string | null
          registros_atualizados?: number | null
          total_linhas?: number | null
        }
        Update: {
          created_at?: string
          erros?: number | null
          executado_em?: string | null
          id?: string
          novos_registros?: number | null
          origem?: string | null
          registros_atualizados?: number | null
          total_linhas?: number | null
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          aluno_id: string | null
          canal: string | null
          conteudo: string | null
          created_at: string
          enviado_em: string | null
          id: string
          status_envio: string | null
          tipo: string | null
        }
        Insert: {
          aluno_id?: string | null
          canal?: string | null
          conteudo?: string | null
          created_at?: string
          enviado_em?: string | null
          id?: string
          status_envio?: string | null
          tipo?: string | null
        }
        Update: {
          aluno_id?: string | null
          canal?: string | null
          conteudo?: string | null
          created_at?: string
          enviado_em?: string | null
          id?: string
          status_envio?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensalidades: {
        Row: {
          aluno_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          status: string
          turma_id: string | null
          valor: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          turma_id?: string | null
          valor?: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          turma_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "mensalidades_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensalidades_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          created_at: string
          data_pagamento: string
          forma_pagamento: string | null
          id: string
          mensalidade_id: string | null
          observacoes: string | null
          valor_pago: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string | null
          id?: string
          mensalidade_id?: string | null
          observacoes?: string | null
          valor_pago?: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string | null
          id?: string
          mensalidade_id?: string | null
          observacoes?: string | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_mensalidade_id_fkey"
            columns: ["mensalidade_id"]
            isOneToOne: false
            referencedRelation: "mensalidades"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          created_at: string
          curso: string | null
          dias_semana: string | null
          horario: string | null
          id: string
          nome: string
          professor: string | null
          status: string
        }
        Insert: {
          created_at?: string
          curso?: string | null
          dias_semana?: string | null
          horario?: string | null
          id?: string
          nome: string
          professor?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          curso?: string | null
          dias_semana?: string | null
          horario?: string | null
          id?: string
          nome?: string
          professor?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
