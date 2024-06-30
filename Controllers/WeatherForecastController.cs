using Microsoft.AspNetCore.Mvc;

namespace ImagesToVoxel.Controllers;

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

    public class TemperatureRequest
    {
        public int TemperatureF { get; set; }
    }
}
