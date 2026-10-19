import type { ReactNode } from "react";

type PageHeadProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHead({
  title,
  description,
  action,
}: PageHeadProps) {
  return (
    <div className="pageHead">
      <div>
        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>

      {action}
    </div>
  );
}