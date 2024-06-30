using Microsoft.AspNetCore.Mvc;

namespace ImagesToVoxel.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpPost("addone")]
        public ActionResult<WeatherForecast> AddOne([FromBody] InputNumber input)
        {
            var result = new WeatherForecast
            {
                Result = input.Number + 1
            };
            return Ok(result);
        }
    }

    public class InputNumber
    {
        public int Number { get; set; }
    }
}
