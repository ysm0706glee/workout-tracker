"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "../actions";
import { Loader2, Check } from "lucide-react";
import type { UserProfile } from "@/types/database";

const EXPERIENCE = [
  { value: "beginner", label: "Beginner", desc: "0-6 months" },
  { value: "intermediate", label: "Intermediate", desc: "6mo-2yr" },
  { value: "advanced", label: "Advanced", desc: "2+ years" },
] as const;

interface ProfileFormProps {
  profile: UserProfile | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [experience, setExperience] = useState<UserProfile["experience"]>(profile?.experience ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        display_name: displayName || undefined,
        experience,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Display Name */}
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">Display Name</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">{email}</p>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card className="py-4">
        <CardHeader className="px-4 py-0">
          <CardTitle className="text-sm">Experience Level</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <div className="flex gap-2">
            {EXPERIENCE.map((e) => (
              <button
                key={e.value}
                onClick={() => setExperience(e.value)}
                disabled={saving}
                className={`flex-1 rounded-[14px] border p-3 text-center transition-colors disabled:opacity-50 ${
                  experience === e.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div className="text-sm font-semibold">{e.label}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{e.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Saved
          </>
        ) : (
          "Save Profile"
        )}
      </Button>
    </div>
  );
}
