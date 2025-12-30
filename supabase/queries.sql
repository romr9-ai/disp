select
  d.date_value,
  count(*) as total
from public.responses r
join public.event_dates d
  on d.event_id = r.event_id
where d.date_value = any (r.available_dates)
  and r.event_id = 'EVENT_UUID'
group by d.date_value
order by total desc;
