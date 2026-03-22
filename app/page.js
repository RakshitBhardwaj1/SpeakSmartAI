"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "./dashboard/_components/Header";
import Link from "next/link";
import { ArrowRight, AudioLines, BadgeCheck, Sparkles } from "lucide-react";

const featureCards = [
  {
    title: "Adaptive AI Interviews",
    description:
      "Question sets are generated from your resume and role context so every round feels realistic.",
    icon: Sparkles,
  },
  {
    title: "Voice + Behavior Insights",
    description:
      "Analyze delivery, confidence, and communication flow with instant actionable guidance.",
    icon: AudioLines,
  },
  {
    title: "Hiring-Grade Reports",
    description:
      "Track score evolution question-by-question and prepare with measurable interview readiness.",
    icon: BadgeCheck,
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen pb-12">
      <Header />

      <section className="relative mx-auto mt-8 w-full max-w-7xl px-4 md:px-8">
        <div className="glass-panel relative overflow-hidden rounded-3xl px-6 py-12 md:px-12 md:py-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-14 bottom-10 h-36 w-36 rounded-full bg-cyan-300/30 blur-3xl" />

          

          <h1 className="mx-auto max-w-5xl text-center text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-7xl">
            {"Feedback based on your response analysis".split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.34, delay: index * 0.07 }}
                className="mr-3 inline-block"
              >
                {index > 1 && index < 5 ? (
                  <span className="text-gradient-brand">{word}</span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.42, delay: 0.45 }}
            className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-slate-700 md:text-lg"
          >
            SmartSpeekAI enhances your preparation with dynamic role-based questions, recorded answer practice, and clear AI-driven feedback reports so your final interview feels familiar, confident, and controlled.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="cta-shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 sm:w-auto"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white/75 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 sm:w-auto"
            >
              Start Free Session
            </Link>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {featureCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.8 + index * 0.12 }}
                  className="premium-card p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-orange-500/20 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="premium-card p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Interviews Simulated</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">10k+</p>
          </div>
          <div className="premium-card p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Avg. Confidence Boost</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">41%</p>
          </div>
          <div className="premium-card p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Roles Covered</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">250+</p>
          </div>
        </div>
      </section>

    </div>
    )
  }