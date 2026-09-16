// Recruiter-facing case study registry.
// Only entries with verified: true should ever render on the public portfolio.
// Keep this file factual: do not add client names, metrics, roles or tool claims
// until the supporting project assets have been reviewed.

export const caseStudies = [];

export const CASE_STUDY_TEMPLATE = {
  verified: false,
  slug: '',
  title: '',
  discipline: '',
  summary: '',
  problem: '',
  workflow: '',
  result: '',
  role: '',
  tools: [],
  media: {
    hero: '',
    input: '',
    output: '',
    workflowGraph: '',
    breakdown: [],
  },
  production: {
    resolution: '',
    fps: '',
    hardware: '',
    notes: '',
  },
};

export function getVerifiedCaseStudies() {
  return caseStudies.filter(study => study.verified === true);
}
