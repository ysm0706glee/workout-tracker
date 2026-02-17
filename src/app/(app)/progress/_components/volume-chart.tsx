"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  volume: number;
}

export function VolumeChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-[13px] uppercase tracking-wider text-muted-foreground">
          Total Volume Per Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
                  value: "Volume",
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
              <Bar
                dataKey="volume"
                name="Volume"
                fill="rgba(0,206,201,0.6)"
                stroke="#00cec9"
                strokeWidth={1.5}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
