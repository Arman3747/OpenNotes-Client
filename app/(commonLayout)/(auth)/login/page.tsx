import Login from "@/components/Auth/Login";

const LoginPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) => {
  const params = (await searchParams) || {};
  // console.log("searchParams:", redirect);

  return (
    <main className="min-h-screen">
      <section>
        <div className="max-w-3xl m-2 mx-auto flex flex-col justify-center items-center w-full min-h-screen">
          {/* <h3 className="text-3xl my-4 text-center">Login Page</h3> */}
          <div className="w-full max-w-sm">
            <Login redirect={params.redirect}></Login>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
