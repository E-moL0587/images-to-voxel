namespace Frontend.Api;

public class WeatherForecast {
  public DateTime Date { get; set; }
  public int TemperatureC { get; set; }
  public int TemperatureF => 32 + TemperatureC;
  public string? Summary { get; set; }
}
