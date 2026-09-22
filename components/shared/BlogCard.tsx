/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Eye, MessageSquare, ThumbsUp } from "lucide-react";

const BlogCard = ({ blog }: { blog: any }) => {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video" />

      {/* 245*137  */}
      <Image
        src={blog.coverImage}
        alt={blog.title}
        width={245}
        height={137}
        className="relative z-20 aspect-video w-full object-cover"
      />

      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
        <CardDescription>
          {blog?.author?.name}, - {blog?.readTime} {" min read"}
          {/* <FormattedDate dateString={blog?.createdAt}></FormattedDate> */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">
              <Eye data-icon="inline-start"></Eye> {blog?.views}
            </Badge>
            <Badge variant="outline">
              <ThumbsUp data-icon="inline-start"></ThumbsUp> {blog?.likesCount}
            </Badge>
            <Badge variant="outline">
              <MessageSquare data-icon="inline-start"></MessageSquare>
              {blog?.commentsCount}
            </Badge>
          </div>
        </CardDescription>
        {/* <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription> */}
      </CardHeader>
      <CardFooter>
        {/* <Button className="w-full">Read More</Button> */}
        <Link className="w-full" href={`/blogs/${blog.id}`} prefetch={true}>
          <Button className="w-full">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
