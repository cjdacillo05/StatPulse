import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export function AboutView() {
  return (
    <div className="space-y-6">
      <PageHeader title="ADVSTAT" description="Advanced Statistical Analysis System" />

      <Card>
        <CardHeader>
          <CardTitle>Mission</CardTitle>
          <CardDescription>Built for analysis, interpretation, and reporting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>ADVSTAT is a compact statistical workspace for learning and practical exploration. It combines core descriptive and inferential tools into one interface so users can fit models, test hypotheses, inspect assumptions, and interpret the outcomes in plain language.</p>
          <p>It runs entirely in the browser and stores saved analyses locally so that the workflow stays lightweight and accessible without a backend service.</p>
        </CardContent>
      </Card>
    </div>
  );
}
