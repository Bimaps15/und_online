import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function GlassCard({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  const reduceMotion = useReducedMotion()
  const animationDelay = (className.length % 5) * 0.16

  return (
    <motion.div
      className={`glass-card ${className}`}
      animate={reduceMotion ? undefined : { scale: [0.985, 1, 0.985] }}
      transition={reduceMotion ? undefined : { duration: 5.2, delay: animationDelay, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={reduceMotion ? undefined : { scale: 1.015 }}
    >
      {children}
    </motion.div>
  )
}

export function WeddingSection({ id, eyebrow, title, children, className = '' }: PropsWithChildren<{ id: string; eyebrow?: string; title: string; className?: string }>) {
  return (
    <motion.section id={id} className={`wedding-section ${className}`} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }} viewport={{ once: false, amount: 0.18 }}>
      <div className="section-heading">{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2><LeafDivider /></div>
      {children}
    </motion.section>
  )
}

export function LeafDivider() {
  return <div className="leaf-divider" aria-hidden="true"><i /><b>&#10086;</b><i /></div>
}

export function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props}>{children}</button>
}

export function Toast({ message }: { message: string }) {
  return <div className="toast" role="status" aria-live="polite">{message}</div>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>
}
