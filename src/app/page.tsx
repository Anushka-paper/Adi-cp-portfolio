import { ProfileCard } from "@/components/profile-card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-24 dark:bg-black">
      <ProfileCard
        name="Aditya"
        role="Competitive Programmer"
        email="aditya@example.com"
        statusText="Grinding rating"
        glowText="Codeforces Expert"
      />
    </div>
  );
}
