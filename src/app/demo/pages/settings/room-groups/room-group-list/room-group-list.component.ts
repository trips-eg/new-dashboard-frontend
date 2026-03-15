import { RoomGroupsService } from 'src/app/shared/services/room-groups.service';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-group-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './room-group-list.component.html',
  styleUrl: './room-group-list.component.scss'
})
export class RoomGroupListComponent implements OnInit {
  roomGroups: any[] = [];
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  first: number = 0;
  search: string = '';
  filterMap = {
    pageIndex: this.first / this.rowsPerPage + 1,
    pageSize: this.rowsPerPage,
    search: this.search
  };

  constructor(
    private RoomGroupsService: RoomGroupsService,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoomGroups(this.filterMap);
  }
  pageChange(event: any) {
    this.filterMap = {
      pageIndex: event.first / event.rows + 1,
      pageSize: event.rows,
      search: this.search
    };
    this.first = event.first;
    this.rowsPerPage = event.rows;
    this.loadRoomGroups(this.filterMap);
  }
  onSearch() {
    // Reset to first page
    this.filterMap = {
      pageIndex: this.first / this.rowsPerPage + 1,
      pageSize: this.rowsPerPage,
      search: this.search
    };
    this.first = 0;
    this.loadRoomGroups(this.filterMap);
  }
  loadRoomGroups(FilterMap: FilterMap): void {
    // const filterMap = {
    //   pageIndex: this.first / this.rowsPerPage + 1,
    //   pageSize: this.rowsPerPage,
    //   search: this.search
    // };
    this.RoomGroupsService.getAllRoomGroups(this.filterMap).subscribe(
      (res) => {
        console.log('Room Groups:', res);
        this.totalRecords = res.data.itemsCount;
        this.roomGroups = res.data.data;
        console.log('Room Groups List:', this.roomGroups);
      },
      (error) => {
        console.error('Error fetching room groups', error);
      }
    );
  }

  editRoomGroup(id) {
    this.Router.navigate(['/room-groups-form', id]);
  }
}
