export interface SocialPost {
  _id: string;
  content: string;
  postType: string;
  images: string[];
  status: "draft" | "published";
  author: {
    _id: string;
    name: string;
    email: string;
  };
  views: number;
  likes: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}