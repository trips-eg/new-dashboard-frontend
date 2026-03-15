import { TableLazyLoadEvent } from 'primeng/table';
import { BaseSearchCriteria, FilterItem } from '../mapping/filterMap'; // تأكد من مسار الموديل الخاص بك

export class TableRequestBuilder {

  /**
   * دالة ثابتة (Static) لتحويل حدث PrimeNG إلى هيكل الباك اند القياسي
   * @param event حدث الـ LazyLoad القادم من الجدول
   * @param globalSearch كلمة البحث العامة (اختياري)
   */
  public static build(event: TableLazyLoadEvent, globalSearch: string = ''): BaseSearchCriteria {
    
    // 1. حساب أرقام الصفحات
    // PrimeNG يعطينا "first" (رقم أول عنصر)، نحوله لرقم صفحة (0, 1, 2...)
    const pageSize = event.rows || 10;
    const pageIndex = (event.first || 0) / pageSize;

    // 2. تحديد اتجاه الترتيب
    // تحويل 1/-1 إلى "asc"/"desc"
    let sortDirection = '';
    if (event.sortOrder === 1) sortDirection = 'asc';
    else if (event.sortOrder === -1) sortDirection = 'desc';

    // 3. استخراج الفلاتر (The Magic Part)
    const backendFilters: FilterItem[] = [];

    if (event.filters) {
      console.log(event.filters);
      // نلف على كل مفاتيح الفلاتر الموجودة (name, price, status...)
      Object.keys(event.filters).forEach((key) => {
        const filterMeta = event.filters![key];
        console.log(filterMeta);
        let filterValue = null;

        // التعامل مع PrimeNG 17 (قد يرسل مصفوفة Constraints أو كائن واحد)
        if (Array.isArray(filterMeta)) {
          // لو مصفوفة، بناخد أول قيمة شغالة (ليست null)
          const activeFilter = filterMeta.find(f => f.value !== null && f.value !== '' && f.value !== undefined);
          if (activeFilter) {
            filterValue = activeFilter.value;
          }
        } else if (filterMeta && 'value' in filterMeta) {
          // لو كائن مباشر
          filterValue = filterMeta.value;
        }

        // لو وجدنا قيمة حقيقية، نضيفها لقائمة فلاتر الباك اند
        if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
          backendFilters.push({
            column: key,    // اسم العمود كما هو معرف في field HTML
            value: filterValue
          });
        }
      });
    }

    // 4. إرجاع الكائن النهائي الجاهز للإرسال
    return {
      isPagingEnabled: true,
      pageIndex: pageIndex +1,     // انتبه: لو الباك اند بيبدأ من 1 زود +1 هنا
      pageSize: pageSize,
      search: globalSearch || '',
      sortColumn: event.sortField ? String(event.sortField) : '',
      sortDirection: sortDirection,
      filters: backendFilters
    };
  }
}