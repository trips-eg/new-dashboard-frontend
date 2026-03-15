import { Injectable } from '@angular/core';
import { APIs } from '../model/helpers';
import { ApiCallerService } from 'src/app/theme/shared/services/api-caller.service';
import { Observable } from 'rxjs';
import { FilterMap } from '../mapping/filterMap';

@Injectable({
  providedIn: 'root'
})
export class OutingFeaturesService {
  endPoints = APIs.OutingFeatures;

  constructor(private apiCaller: ApiCallerService) {}

  // getAllOutingFeatures() {
  //   return this.apiCaller.get(this.endPoints.getAllOutingsFeatures);
  // }
  getAllOutingFeatures(filter: any): Observable<any> {
    return this.apiCaller.post(this.endPoints.getAllOutingsFeatures, filter);
  }

  getOutingFeatureById(id: number) {
    return this.apiCaller.get(this.endPoints.getOutingFeaturesById + id);
  }

  addOutingFeature(data: FormData) {
    return this.apiCaller.post(this.endPoints.addOutingFeatures, data);
  }

  updateOutingFeature(data: FormData) {
    return this.apiCaller.put(this.endPoints.updateOutingFeatures, data);
  }

  deleteOutingFeature(id: number) {
    return this.apiCaller.delete(this.endPoints.deleteOutingFeatures + id);
  }
}
