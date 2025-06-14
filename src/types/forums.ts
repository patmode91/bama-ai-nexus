
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  title: string;
  content: string;
  author_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    company: string;
  };
  category?: ForumCategory;
  reply_count?: number;
  last_reply_at?: string;
  upvotes?: number;
  user_vote?: 'up' | 'down' | null;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    company: string;
  };
  upvotes?: number;
  user_vote?: 'up' | 'down' | null;
}

export interface ForumVote {
  id: string;
  user_id: string;
  topic_id?: string;
  reply_id?: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface CreateTopicData {
  category_id: string;
  title: string;
  content: string;
}

export interface CreateReplyData {
  topic_id: string;
  content: string;
}
