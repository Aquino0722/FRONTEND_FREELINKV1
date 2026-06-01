"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Project } from "@/types/common";

export function ProjectCard({ 
  project, 
  index = 0, 
  applicationStatus 
}: { 
  project: Project; 
  index?: number; 
  applicationStatus?: string; 
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>
      <Link href={`/projects/${project.id}`}>
        <Card className={`relative h-full p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm ${
          applicationStatus ? "border-indigo-200 bg-indigo-50/10 shadow-sm" : ""
        }`}>
          {applicationStatus && (
            <div className="absolute right-4 top-4 z-10">
              <StatusBadge status={applicationStatus} />
            </div>
          )}
          <div className="mb-4 flex items-start justify-between gap-3">
            <StatusBadge status={project.status} />
            {!applicationStatus && <span className="text-sm font-medium">{formatCurrency(project.budget)}</span>}
          </div>
          <h3 className={`line-clamp-2 font-medium text-slate-950 ${applicationStatus ? "pr-24" : ""}`}>
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{project.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.requiredSkills.slice(0, 3).map((skill) => (
              <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Entrega {formatDate(project.deadlineDate)}
            </p>
            {applicationStatus && (
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(project.budget)}</span>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
