import { BlogService } from '@/services/blog-service';
import { Metadata, ResolvingMetadata } from 'next';
import BlogDetailContent from './blog-detail-content';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the blog id from the params
  const id = (await params).id;

  // Fetch blog data
  try {
    const blog = await BlogService.getBlog(id);

    // Default image if no blog image is available
    const imageUrl = blog.images && blog.images[0]?.url
      ? blog.images[0].url
      : '/thumbnail.png';

    // Get the parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: `${blog.title} | BroGlow Blog`,
      description: blog.content?.replace(/<[^>]+>/g, '').slice(0, 200) || "Read this article on BroGlow - AI-Powered Men's Skincare",
      openGraph: {
        title: blog.title,
        description: blog.content?.replace(/<[^>]+>/g, '').slice(0, 200) || "Read this article on BroGlow",
        type: 'article',
        images: [imageUrl, ...previousImages],
        authors: blog.author && typeof blog.author === 'object' && (blog.author.name || blog.author.email)
          ? [(blog.author.name || blog.author.email.split("@")[0])]
          : ['BroGlow'],
        publishedTime: blog.createdAt,
        tags: blog.tags
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.content?.replace(/<[^>]+>/g, '').slice(0, 200) || "Read this article on BroGlow",
        images: [imageUrl]
      }
    };
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
    return {
      title: 'Blog Post | BroGlow',
      description: 'Read this article on BroGlow - AI-Powered Men\'s Skincare',
    };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  return <BlogDetailContent id={id} />;
}
