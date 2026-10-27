import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Inbox, Phone } from "lucide-react";
import { can } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/session";
import { getParticipant, listProvinces } from "@/lib/admin/api/participants";
import { getFestival } from "@/lib/admin/api/festival";
import { editionName, kindLabels, reviewLabels, sectionLabels } from "@/lib/admin/labels";
import { formatDigits, formatShortDate, fullName } from "@/lib/admin/format";
import { Avatar, Badge, Card, CardHeader, EmptyState } from "@/components/admin/primitives";
import { PageHeader } from "@/components/admin/page-header";
import { Table, Td, Th, Tr, rowLinkClass } from "@/components/admin/table";
import { AdminLink } from "@/features/admin/navigation";
import { ParticipantForm } from "@/features/admin/participants/ParticipantForm";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/participants/[id]">): Promise<Metadata> {
  const person = await getParticipant((await params).id);
  return { title: person ? fullName(person) : "شرکت‌کننده" };
}

export default async function ParticipantPage({
  params,
}: PageProps<"/[locale]/admin/participants/[id]">) {
  const viewer = await requirePermission("participants.view");
  const [person, provinces, festival] = await Promise.all([
    getParticipant((await params).id),
    listProvinces(),
    getFestival(),
  ]);
  if (!person) notFound();
  const sections = {
    art: sectionLabels("art", festival.topics),
    science: sectionLabels("science", festival.topics),
  };

  return (
    <>
      <PageHeader
        back={{ href: "/admin/participants", label: "شرکت‌کنندگان" }}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={fullName(person)} id={person.id} size="lg" />
            {fullName(person)}
          </span>
        }
        meta={
          <>
            <span className="text-caption text-ink-muted">
              {person.province} · متولد {formatDigits(person.birthYear)} · ثبت‌نام{" "}
              {formatShortDate(person.registeredAt)}
            </span>
            <a
              href={`tel:${person.phone}`}
              className="inline-flex items-center gap-1 text-caption text-teal hover:underline"
            >
              <Phone className="size-3.5" aria-hidden />
              {formatDigits(person.phone)}
            </a>
          </>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="overflow-hidden">
          <CardHeader
            title="ارسال‌ها"
            description="همه آثار و مقالاتی که این شرکت‌کننده در دوره‌های مختلف فرستاده است."
          />
          <div className="mt-4">
            {person.submissions.length === 0 ? (
              <EmptyState icon={Inbox} title="ارسالی ثبت نشده است" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>عنوان</Th>
                    <Th>بخش</Th>
                    <Th>دوره</Th>
                    <Th>تاریخ</Th>
                    <Th>وضعیت</Th>
                  </tr>
                </thead>
                <tbody>
                  {person.submissions.map((item) => (
                    <Tr key={item.id}>
                      <Td>
                        {can(viewer, `${item.kind}.view`) ? (
                          <AdminLink
                            href={`/admin/${item.kind}/${item.id}?edition=${item.editionId}`}
                            className={rowLinkClass}
                          >
                            {item.title}
                          </AdminLink>
                        ) : (
                          item.title
                        )}
                        <span className="block text-2xs text-ink-muted">
                          {kindLabels[item.kind].one} · <span dir="ltr">{item.code}</span>
                        </span>
                      </Td>
                      <Td className="text-caption">{sections[item.kind][item.category]}</Td>
                      <Td className="text-caption whitespace-nowrap">
                        {editionName(Number(item.editionId))}
                      </Td>
                      <Td className="whitespace-nowrap tabular-nums">
                        {formatShortDate(item.submittedAt)}
                      </Td>
                      <Td>
                        <Badge tone={item.status} dot>
                          {reviewLabels[item.status]}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="مشخصات" />
          <div className="px-5 pt-4 pb-5">
            <ParticipantForm
              person={person}
              provinces={provinces}
              canEdit={can(viewer, "participants.edit")}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
