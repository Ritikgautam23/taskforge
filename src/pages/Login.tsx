import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

// Demo credentials helper
const DEMO_EMAIL = "alex@taskforge.dev";
const DEMO_PASSWORD = "demo123";

const CREDENTIALS_KEY = "taskforge_remembered_credentials";

interface SavedCredentials {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Load saved credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CREDENTIALS_KEY);
      if (saved) {
        const creds: SavedCredentials = JSON.parse(saved);
        form.setValue("email", creds.email);
        form.setValue("password", creds.password);
        setRememberMe(true);
      }
    } catch {
      /* ignore parse errors */
    }
  }, [form]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Save or remove credentials based on remember me
      if (rememberMe) {
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({
          email: data.email,
          password: data.password,
        }));
      } else {
        localStorage.removeItem(CREDENTIALS_KEY);
      }
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    form.setValue("email", DEMO_EMAIL);
    form.setValue("password", DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative z-10 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="h-5 w-5 lg:h-6 lg:w-6" />
            </div>
            <span className="font-display text-xl lg:text-2xl font-bold">TaskForge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold leading-tight mb-3 lg:mb-4">
            Plan, assign, and finish work — <span className="text-accent">together.</span>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-md">
            The calm way to ship work. Organize projects, track tasks, and hit deadlines as a team.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 lg:h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="space-y-1 px-4 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-semibold">TaskForge</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-display">Sign in</CardTitle>
            <CardDescription className="text-sm">
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          {...field}
                          disabled={isLoading}
                          className="h-10 sm:h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm">Password</FormLabel>
                        <button
                          type="button"
                          onClick={fillDemoCredentials}
                          className="text-xs text-accent hover:underline focus:outline-none"
                        >
                          Use demo account
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            className="h-10 sm:h-11 pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 px-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Remember me on this device
                  </label>
                </div>

                <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
                  {isLoading ? "Signing in…" : "Sign in"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>

            <div className="mt-5 sm:mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link to="/signup" className="text-accent hover:underline font-medium">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}