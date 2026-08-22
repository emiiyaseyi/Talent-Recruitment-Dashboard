import { getDashboardData } from "@/lib/sheets";
import { ChartCard } from "@/components/charts/ChartCard";
import { AddPipelineCandidateForm } from "@/components/admin/AddPipelineCandidateForm";
import { ResolveCandidateForm } from "@/components/admin/ResolveCandidateForm";
import { AddConfigValueForm } from "@/components/admin/AddConfigValueForm";
import { UserPlus, CheckCircle2, ListPlus } from "lucide-react";

export default async function AdminPage() {
  const { pipeline, config } = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Changes here write directly to the Google Sheet and appear on the dashboard immediately —
        there's no separate "publish" step.
      </p>

      <ChartCard title="Add a Candidate to the Pipeline" icon={UserPlus} iconColor="var(--series-1)">
        <AddPipelineCandidateForm
          roles={config.roles}
          bus={config.bus}
          officeTypes={config.officeTypes}
          hiringSources={config.hiringSources}
          pipelineStages={config.pipelineStages}
        />
      </ChartCard>

      <ChartCard
        title="Record a Hire Outcome (moves candidate from Pipeline to Hires)"
        icon={CheckCircle2}
        iconColor="var(--series-2)"
      >
        <ResolveCandidateForm pipeline={pipeline} />
      </ChartCard>

      <ChartCard
        title="Add a New BU, Role, Office Type, Hiring Source, or Pipeline Stage"
        icon={ListPlus}
        iconColor="var(--series-5)"
      >
        <AddConfigValueForm />
      </ChartCard>
    </div>
  );
}
