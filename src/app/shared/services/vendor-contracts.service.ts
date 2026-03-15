import { Injectable } from '@angular/core';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { APIs } from '../model/helpers';
import { FilterMap } from '../mapping/filterMap';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorContractsService {
  constructor(private ApiCallerService: ApiCallerService) {}
  endPoints = APIs.VendorContracts;
  getVendorContracts(FilterMap: FilterMap): Observable<any> {
    const queryParams = [
      FilterMap?.pageIndex ? `pageIndex=${FilterMap?.pageIndex}` : null,
      FilterMap?.pageSize ? `pageSize=${FilterMap?.pageSize}` : null,
      FilterMap?.sort ? `sort=${FilterMap?.sort}` : null,
      FilterMap?.Search ? `Search=${FilterMap?.Search}` : null
    ]
      .filter((param) => param !== null)
      .join('&');

    const query = `?${queryParams}`;
    return this.ApiCallerService.get(`${this.endPoints.getVendorContracts}${query}`);
  }
  getVendorContractById(id): Observable<any> {
    return this.ApiCallerService.get(`${this.endPoints.getVendorContractById}${id}`);
  }
  UpdateVendorContractStatus(data): Observable<any> {
    return this.ApiCallerService.put(`${this.endPoints.UpdateVendorContract}`, data);
  }
}
