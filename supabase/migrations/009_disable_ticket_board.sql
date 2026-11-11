-- 009: community ticket board removed from the app; lock the table (can be dropped later)
revoke all on table ticket_offers from anon, authenticated;
comment on table ticket_offers is 'Disabled: community ticket board removed from the app (secondary market goes via TicketSwap link). Safe to drop.';
