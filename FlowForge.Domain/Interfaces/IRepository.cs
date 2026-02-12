using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowForge.Domain.Interfaces;

public interface IRepository<T> where T : class
{
    IQueryable<T> Query(); // Expose IQueryable for flexibility in Services (Pagination/Filtering)
    Task<T?> GetByIdAsync(Guid id);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}
