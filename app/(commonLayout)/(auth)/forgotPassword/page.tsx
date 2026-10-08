import ForgotPassword from "@/components/Auth/ForgotPassword";

const ForgotPasswordPage = async () => {
  return (
    <main className="min-h-screen">
      <section>
        <div className="max-w-3xl m-2 mx-auto flex flex-col justify-center items-center w-full min-h-screen">
          <div className="w-full max-w-sm">
            {/* <Login redirect={params.redirect}></Login>
             */}
            <ForgotPassword></ForgotPassword>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
