"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  maxWeight: number;
  e1rm: number;
}

export function WeightChart({
  data,
  unit,
}: {
  data: ChartDataPoint[];
  unit: string;
}) {
  return (
    <Card className="mb-3.5">
      <CardHeader className="pb-3">
        <CardTitle className="text-[13px] uppercase tracking-wider text-muted-foreground">
          Max Weight Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(42,42,64,0.5)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8888a0", fontSize: 11 }}
                stroke="rgba(42,42,64,0.5)"
              />
              <YAxis
                tick={{ fill: "#8888a0", fontSize: 11 }}
                stroke="rgba(42,42,64,0.5)"
                label={{
                  value: `Weight (${unit})`,
                  angle: -90,
                  position: "insideLeft",
                  fill: "#8888a0",
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,32,0.95)",
                  border: "1px solid #2a2a40",
                  borderRadius: 8,
                  color: "#e8e8f0",
                }}
                labelStyle={{ color: "#a29bfe" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#8888a0" }}
              />
              <Line
                type="monotone"
                dataKey="maxWeight"
                name="Max Weight"
                stroke="#6c5ce7"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="e1rm"
                name="Est. 1RM"
                stroke="#f0a500"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
