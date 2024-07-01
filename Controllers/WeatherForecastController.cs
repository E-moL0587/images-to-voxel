using Microsoft.AspNetCore.Mvc;
namespace ImagesToVoxel.Controllers {

  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase {

    [HttpPost("upload")]
    public ActionResult Upload([FromBody] Base64StringRequest request) { return Ok(new { base64String = request.Base64String }); }
    public class Base64StringRequest { public string? Base64String { get; set; } }
  }
}
