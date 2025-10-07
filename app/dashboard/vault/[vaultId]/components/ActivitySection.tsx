"use client";

import React from "react";
import { Card } from "@/app/components/ui/Card";

export function ActivitySection() {
  return (
    <Card className="space-y-2" role="region" aria-label="Recent activity">
      <h2 className="text-lg font-semibold">Activity</h2>
      <p className="text-sm text-secondary-text">No recent events yet. Actions you take here will appear in this timeline.</p>
    </Card>
  );
}
