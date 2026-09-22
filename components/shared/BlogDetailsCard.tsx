/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import { FormattedDate } from "./FormattedDate";
import JsonBlogCard from "./JsonBlogCard";

const BlogDetailsCard = ({ blog }: { blog: any }) => {
  return (
    <Card className="relative mx-auto w-full pt-0">
      <div className="absolute inset-0 z-30 aspect-video" />
      <Image
        src={blog.coverImage}
        alt={blog.title}
        width={500}
        height={280}
        className="relative z-20 aspect-video w-full object-cover"
      />
      <CardHeader>
        {/* <CardAction>
          <Badge variant="secondary">Featured</Badge>
        </CardAction> */}
        <CardTitle>{blog?.title}</CardTitle>
        <CardDescription>
          By - {blog?.author?.name},{" "}
          <FormattedDate dateString={blog?.createdAt}></FormattedDate>
        </CardDescription>
      </CardHeader>
      {/* <CardContent>{blog?.content}</CardContent> */}
      <CardContent>
        <JsonBlogCard content={blog?.content}></JsonBlogCard>
      </CardContent>

      {/* <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter> */}
    </Card>
  );
};

export default BlogDetailsCard;
