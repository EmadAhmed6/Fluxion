export interface StoryUser {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: { url?: string; publicId?: string | null };
}

export interface StoryReaction {
  user: string | StoryUser;
  type: string;
}

export interface StoryReply {
  user: string | StoryUser;
  message: string;
}

export type StoryViewer = StoryUser;

export interface Story {
  _id: string;
  author: string | StoryUser;
  title: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  views?: (string | StoryUser)[];
  replies?: StoryReply[];
  authorViewed?: boolean;
  reactions?: StoryReaction[];
  createdAt: string;
  updatedAt?: string;
}

export interface StoryGroup {
  author: StoryUser;
  stories: Story[];
}
