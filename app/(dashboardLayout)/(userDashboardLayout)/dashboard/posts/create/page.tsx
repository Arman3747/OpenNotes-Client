import CreatePostForm from "@/components/Dashboard/User/CreatePostForm";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";

type Category = {
  id: string;
  categoriesName: string;
};

type CategoriesResponse = {
  success: boolean;
  message: string;
  data: Category[];
};

const CreatePostsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=%2Fdashboard%2Fposts%2Fcreate");
  }

  const response = await fetch("http://localhost:5000/api/v1/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load categories");
  }

  const categoriesResult: CategoriesResponse = await response.json();

  if (!categoriesResult.success || !Array.isArray(categoriesResult.data)) {
    throw new Error("Invalid categories response");
  }

  return (
    <main className="p-6">
      <CreatePostForm categories={categoriesResult.data} />
    </main>
  );
};

export default CreatePostsPage;
