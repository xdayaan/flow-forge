import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = `${environment.apiUrl}/projects`;

    constructor(private http: HttpClient) { }

    getProjects(page: number, pageSize: number): Observable<PagedResult<Project>> {
        let params = new HttpParams()
            .set('pageNumber', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<PagedResult<Project>>(this.apiUrl, { params });
    }

    getProject(id: string): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    createProject(project: CreateProjectDto): Observable<Project> {
        return this.http.post<Project>(this.apiUrl, project);
    }

    updateProject(id: string, project: UpdateProjectDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, project);
    }

    deleteProject(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
