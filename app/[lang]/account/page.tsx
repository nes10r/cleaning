import { ROUTES } from '@/config/routes';
import { localizePath } from '@/lib/i18n';
import { getPageContext, type LangParams } from '@/lib/page';
import { ButtonLink } from '@/components/ui/button-link';
import { EmptyState } from '@/components/ui/empty-state';

export default async function AccountOverview({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  const a = dict.account;
  return (
    <>
      <section aria-labelledby="upcoming-title" className="grid gap-4">
        <h2 id="upcoming-title" className="text-h4 font-bold">
          {a.upcoming}
        </h2>
        <EmptyState
          icon="calendarX"
          title={a.noUpcoming}
          text={a.noUpcomingText}
          action={
            <ButtonLink href={localizePath(locale, ROUTES.booking)} arrow>
              {dict.common.bookCta}
            </ButtonLink>
          }
        />
      </section>
      <section aria-labelledby="history-title" className="grid gap-4">
        <h2 id="history-title" className="text-h4 font-bold">
          {a.history}
        </h2>
        <EmptyState icon="repeat" title={a.noHistory} text={a.noHistoryText} />
      </section>
    </>
  );
}
