
export enum UserVersion {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  version: UserVersion;
  tokenQuota: {
    used: number;
    total: number;
  };
}

export interface Character {
  id: string;
  name: string;
  role: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: '导演' | '编剧' | '制片人' | '后期' | '组长';
  status: 'Active' | 'Idle' | 'Pending';
  joinDate: string;
  avatar: string;
}

export interface Brand {
  id: string;
  name: string;
  slogan: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  projectCount: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  content?: string;
  script_dialogue?: string;
  script_action?: string;
  script_camera?: string;
  characters?: Character[];
  status: 'planning' | 'shooting' | 'post-production' | 'completed';
  updatedAt: string;
  author: string;
}

export interface ScriptVersion {
  id: string;
  content: string;
  timestamp: string;
  note: string;
}

export interface DataMetric {
  label: string;
  value: number;
  change: number;
  type: 'up' | 'down';
}
