import { authorizedBlob } from "@/lib/authorized-client";

export type ReportSubject = "fundraising" | "child" | "class";
export type ReportFormat = "PDF" | "CSV";

export type ReportRequest = {
  subject: ReportSubject;
  id: number;
  format: ReportFormat;
  from: string;
  to: string;
};

const SUBJECT_PATHS: Record<ReportSubject, string> = {
  fundraising: "fundraisings",
  child: "children",
  class: "classes",
};

function buildReportPath(request: ReportRequest): string {
  const query = new URLSearchParams({ format: request.format });
  if (request.from !== "") {
    query.set("from", request.from);
  }
  if (request.to !== "") {
    query.set("to", request.to);
  }
  return `/reports/${SUBJECT_PATHS[request.subject]}/${request.id}?${query.toString()}`;
}

function downloadReport(request: ReportRequest): Promise<Blob> {
  return authorizedBlob(buildReportPath(request));
}

function reportFileName(request: ReportRequest): string {
  return `raport-${request.subject}-${request.id}.${request.format.toLowerCase()}`;
}

export { downloadReport, reportFileName };
