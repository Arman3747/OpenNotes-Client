import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const PublicFooter = () => {
  return (
    <footer className="border-t bg-background px-2">
      <div className="max-w-3xl mx-auto flex justify-between items-center *:my-2 *:py-2">
        <div>
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/favicon.ico" width={32} height={32} alt="logo"></Image>
            <span className="text-xl font-bold text-primary">Open Notes</span>
          </Link>
        </div>

        <div>
            <Button>All Blogs</Button>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
