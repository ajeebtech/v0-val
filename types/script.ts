export type Script = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateScriptDTO = Omit<Script, 'id' | 'created_at' | 'updated_at'>;
export type UpdateScriptDTO = Partial<Omit<Script, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
