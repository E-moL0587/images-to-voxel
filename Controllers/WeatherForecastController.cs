using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ImagesToVoxel.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static int _temperatureF = 32; // Initial temperature in Fahrenheit

        [HttpGet]
        public ActionResult Get()
        {
            return Ok(new { temperatureF = _temperatureF });
        }

        [HttpPost("increment")]
        public ActionResult Increment([FromBody] TemperatureRequest request)
        {
            _temperatureF = request.TemperatureF + 1;
            return Ok(new { temperatureF = _temperatureF });
        }

        [HttpPost("upload")]
        public ActionResult Upload([FromBody] Base64StringRequest request)
        {
            // 何もせずにそのまま返す
            return Ok(new { base64String = request.Base64String });
        }

        public class TemperatureRequest
        {
            public int TemperatureF { get; set; }
        }

        public class Base64StringRequest
        {
            public string Base64String { get; set; }
        }
    }
}
