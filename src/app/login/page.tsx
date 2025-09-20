import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full flex-col p-6 md:p-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
      <div className="text-center text-sm text-muted-foreground">
        © 2025 Lumo Portal. All rights reserved.
      </div>
    </div>
  );
}
