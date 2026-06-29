using System.Collections.Generic;

namespace DapperDashboardProject.Dtos.DashboardDtos
{
    public class ResultProductTablePagedDto
    {
        public List<ResultProductTableDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)System.Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 1));
    }
}
