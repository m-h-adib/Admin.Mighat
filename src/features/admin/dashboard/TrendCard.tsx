"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/primitives";
import { Segmented } from "@/components/admin/controls";
import { TrendChart } from "@/components/admin/charts";
import { formatNumber } from "@/lib/admin/format";
import { type Dashboard, type SubmissionKind, type TrendRange } from "@/lib/admin/types";

interface TrendCardProps {
  trend: Dashboard["trend"];
  kinds: SubmissionKind[];
}

const units: Record<SubmissionKind, { one: string; many: string }> = {
  art: { one: "اثر", many: "آثار هنری" },
  science: { one: "مقاله", many: "مقالات" },
};

export function TrendCard({ trend, kinds }: TrendCardProps) {
  const [kind, setKind] = useState<SubmissionKind>(kinds[0] ?? "art");
  const [range, setRange] = useState<TrendRange>("month");
  const { title, points } = trend[range];
  const total = points.reduce((sum, point) => sum + point[kind], 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        icon={TrendingUp}
        title="روند دریافت آثار"
        description={`${formatNumber(total)} ${units[kind].one} در ${title}`}
        action={
          <div className="flex flex-wrap gap-2">
            {kinds.length > 1 && (
              <Segmented
                label="نوع ارسال"
                size="sm"
                value={kind}
                onValueChange={setKind}
                options={kinds.map((value) => ({ value, label: units[value].many }))}
              />
            )}
            <Segmented
              label="بازه زمانی"
              size="sm"
              value={range}
              onValueChange={setRange}
              options={[
                { value: "month", label: "ماه جاری" },
                { value: "year", label: "سال جاری" },
              ]}
            />
          </div>
        }
      />
      <div className="px-4 pt-3 pb-4">
        <TrendChart
          key={range}
          data={points.map((point) => ({
            key: point.key,
            label: point.label,
            detail: point.detail,
            value: point[kind],
          }))}
          label={`نمودار تعداد ${units[kind].many} دریافتی در ${title}`}
          unit={units[kind].one}
        />
      </div>
    </Card>
  );
}
