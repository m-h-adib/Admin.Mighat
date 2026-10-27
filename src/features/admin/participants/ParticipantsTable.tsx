"use client";

import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/admin/primitives";
import { Table, Td, Th, Tr, rowLinkClass } from "@/components/admin/table";
import { formatDigits, formatNumber, formatShortDate, fullName } from "@/lib/admin/format";
import { type ParticipantRow } from "@/lib/admin/types";
import { AdminLink, PendingFrame } from "@/features/admin/navigation";

export function ParticipantsTable({ rows }: { rows: ParticipantRow[] }) {
  if (rows.length === 0) return <EmptyState icon={UsersRound} title="شرکت‌کننده‌ای پیدا نشد" />;
  return (
    <PendingFrame>
      <Table>
        <thead>
          <tr>
            <Th>نام</Th>
            <Th>کد ملی</Th>
            <Th>تلفن همراه</Th>
            <Th className="hidden md:table-cell">کاروان</Th>
            <Th>استان</Th>
            <Th className="text-center">آثار هنری</Th>
            <Th className="text-center">مقالات</Th>
            <Th className="hidden lg:table-cell">ثبت‌نام</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.id}>
              <Td className="whitespace-nowrap">
                <AdminLink href={`/admin/participants/${row.id}`} className={rowLinkClass}>
                  {fullName(row)}
                </AdminLink>
              </Td>
              <Td className="tabular-nums">{formatDigits(row.nationalId)}</Td>
              <Td className="tabular-nums">{formatDigits(row.phone)}</Td>
              <Td className="hidden tabular-nums md:table-cell">{formatDigits(row.caravanNo)}</Td>
              <Td className="whitespace-nowrap">{row.province}</Td>
              <Td className="text-center tabular-nums">{row.art ? formatNumber(row.art) : "—"}</Td>
              <Td className="text-center tabular-nums">
                {row.science ? formatNumber(row.science) : "—"}
              </Td>
              <Td className="hidden whitespace-nowrap tabular-nums lg:table-cell">
                {formatShortDate(row.registeredAt)}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </PendingFrame>
  );
}
