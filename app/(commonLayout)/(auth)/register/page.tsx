import Register from "@/components/Auth/Register";
import React from "react";

const RegisterPage = () => {
  return (
    <main className="min-h-screen">
      <section>
        <div className="max-w-3xl m-2 mx-auto flex flex-col justify-center items-center w-full min-h-screen">
          {/* <h3 className="text-3xl my-4 text-center">Register Page</h3> */}
          <div className="w-full max-w-sm">
            <Register></Register>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
