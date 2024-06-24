using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ImagesToVoxel.Controllers {
  public class HomeController : Controller {
    private readonly string _frontImagePath;
    private readonly string _sideImagePath;
    private readonly string _topImagePath;
    private readonly ImagesToPixels _imagesToPixels;
    private readonly PixelsToVoxel _pixelsToVoxel;
    private readonly MarchingCubes _marchingCubes;
    private readonly LaplacianSmoothing _laplacianSmoothing;

    public HomeController() {
      _frontImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/front.png");
      _sideImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/side.png");
      _topImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/top.png");
      _imagesToPixels = new ImagesToPixels();
      _pixelsToVoxel = new PixelsToVoxel();
      _marchingCubes = new MarchingCubes();
      _laplacianSmoothing = new LaplacianSmoothing();
    }

    public IActionResult Index() {
      var frontBinaryData = _imageProcessor.ProcessImage(_frontImagePath);
      var sideBinaryData = _imageProcessor.ProcessImage(_sideImagePath);
      var topBinaryData = _imageProcessor.ProcessImage(_topImagePath);

      ViewData["FrontBinaryData"] = frontBinaryData;
      ViewData["SideBinaryData"] = sideBinaryData;
      ViewData["TopBinaryData"] = topBinaryData;

      var (voxelData, _, _, _) = PrepareData();
      var meshData = _marchingCubes.Mesh(voxelData, 20, 20, 20);
      var smoothData = _laplacianSmoothing.Smooth(meshData);

      ViewData["VoxelData"] = JsonSerializer.Serialize(voxelData);
      ViewData["MeshData"] = JsonSerializer.Serialize(meshData);
      ViewData["SmoothData"] = JsonSerializer.Serialize(smoothData);

      return View();
    }

    private (List<int[]> voxelData, string frontBinaryData, string sideBinaryData, string topBinaryData) PrepareData() {
      var frontBinaryData = _imageProcessor.ProcessImage(_frontImagePath);
      var sideBinaryData = _imageProcessor.ProcessImage(_sideImagePath);
      var topBinaryData = _imageProcessor.ProcessImage(_topImagePath, 90);
      var voxelData = _pixelsToVoxel.GenerateVoxelData(frontBinaryData, sideBinaryData, topBinaryData, 20);

      return (voxelData, frontBinaryData, sideBinaryData, topBinaryData);
    }
  }
}
