"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        setIsSuccess(true);
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
        
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/40 text-center transition-colors duration-300">
          <CardContent className="pt-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Registration Successful!</h2>
            <p className="text-slate-500 dark:text-zinc-400 mb-4">
              Your account has been created. Redirecting you to login...
            </p>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="bg-emerald-500 h-2 rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/40 transition-colors duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-500 dark:text-zinc-400">
            Join NotifyHub to manage your notifications
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-white text-sm">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-zinc-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-white text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-white text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 pr-10 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-white text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-zinc-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 pr-10 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-slate-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
