import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

Future<Uint8List?> captureWidget(GlobalKey key) async {
  final boundary = key.currentContext?.findRenderObject() as RenderRepaintBoundary?;
  if (boundary == null) return null;

  final image = await boundary.toImage();
  final byteData = await image.toByteData();
  return byteData?.buffer.asUint8List();
}