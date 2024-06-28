using Microsoft.AspNetCore.Mvc;

namespace Frontend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArrayProcessorController : ControllerBase
    {
        [HttpPost]
        public IActionResult ProcessArray([FromBody] int[][] array)
        {
            if (array == null || array.Length == 0)
            {
                return BadRequest("Array is null or empty");
            }

            for (int i = 0; i < array.Length; i++)
            {
                for (int j = 0; j < array[i].Length; j++)
                {
                    array[i][j] += 1;
                }
            }

            return Ok(array);
        }
    }
}
